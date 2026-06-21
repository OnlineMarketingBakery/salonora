#!/usr/bin/env node
/**
 * Update Melanie Koelemeijer testimonial copy (NL + EN) to approved client text.
 *
 * Usage:
 *   node src/lib/cms/update-melanie-testimonial.mjs          # dry-run
 *   node src/lib/cms/update-melanie-testimonial.mjs --apply
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const HOST = process.env.PLOI_SSH_HOST?.trim();
const USER = process.env.PLOI_SSH_USER?.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH?.trim();
const WP_ROOT =
  process.env.PLOI_WP_ROOT?.trim() ||
  path.posix.dirname(path.posix.dirname(PLUGINS_PATH || ""));
const apply = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 6237,
    text:
      "Wat begon als een klantcontact groeide uit tot een hele fijne samenwerking met Salonora. Als pedicure wil ik mijn cliënten altijd helpen en te woord staan. In de praktijk merkte ik dat dit tijdens voetbehandelingen simpelweg niet altijd mogelijk is. Dat zorgde soms voor onrust in mijn planning. Salonora heeft met mij meegedacht en geholpen bij het vernieuwen van mijn website en het inrichten van een duidelijke online agenda. Hierdoor is er nu veel meer rust en overzicht in mijn planning. Cliënten kunnen eenvoudig online een afspraak maken en ik kan tijdens de behandeling mijn volledige aandacht geven aan de cliënt in de stoel. Salonora denkt echt met je mee en vertaalt dat naar een oplossing die bij jouw onderneming past. Ik ben er erg blij mee!",
  },
  {
    id: 1337,
    text:
      "What started as a client contact grew into a wonderful collaboration with Salonora. As a pedicurist, I always want to help my clients and be there for them. In practice, I found that during foot treatments this simply is not always possible. That sometimes caused unrest in my schedule. Salonora thought along with me and helped renew my website and set up a clear online booking system. As a result, there is now much more calm and overview in my schedule. Clients can easily book an appointment online and during treatments I can give my full attention to the client in the chair. Salonora really thinks along with you and translates that into a solution that fits your business. I am very happy with it!",
  },
];

if (!HOST || !USER || !WP_ROOT) {
  console.error("Missing PLOI_SSH_HOST, PLOI_SSH_USER, or WP root in .env.local");
  process.exit(1);
}

const REMOTE = `${USER}@${HOST}`;

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function resolveWpCli() {
  const phar = "/tmp/omb-wp-cli.phar";
  const install = `test -f ${shellQuote(phar)} || curl -fsSL -o ${shellQuote(phar)} https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar`;
  const probe = spawnSync("ssh", [REMOTE, `${install} && php ${shellQuote(phar)} --info`], {
    encoding: "utf8",
  });
  if (probe.status === 0) return `php ${shellQuote(phar)}`;
  console.error("Could not run wp-cli on server.");
  process.exit(1);
}

const WP_CLI = resolveWpCli();
const updatesJson = JSON.stringify(UPDATES);

const php = `<?php
if (!function_exists('update_field')) { echo "ACF inactive\\n"; exit(1); }
$dry = ${apply ? "false" : "true"};
$updates = json_decode('${updatesJson.replace(/'/g, "\\'")}', true);
foreach ($updates as $row) {
  $id = (int) ($row['id'] ?? 0);
  $text = (string) ($row['text'] ?? '');
  if ($id <= 0 || $text === '') { echo "skip invalid row\\n"; continue; }
  $post = get_post($id);
  if (!$post) { echo "post {$id}: not found\\n"; continue; }
  $before = wp_strip_all_tags((string) get_field('client_testimonial', $id));
  echo "post {$id} ({$post->post_title}):\\n";
  echo "  before: " . substr($before, 0, 72) . "...\\n";
  echo "  after:  " . substr($text, 0, 72) . "...\\n";
  if (!$dry) {
    update_field('client_testimonial', '<p>' . esc_html($text) . '</p>', $id);
    update_field('client_name', 'Melanie Koelemeijer', $id);
    update_field('client_role', 'Voetzorg Roermond', $id);
    echo "  updated\\n";
  }
}
echo $dry ? "DRY-RUN complete.\\n" : "Done.\\n";
`;

const remotePhp = "/tmp/omb-update-melanie-testimonial.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "APPLY mode" : "DRY-RUN (pass --apply to write)");

const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
