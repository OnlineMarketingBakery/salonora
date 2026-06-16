<?php
/**
 * Salonora headless author card — user profile fields (avatar + social URLs).
 */

if (!defined('ABSPATH')) {
    exit;
}

const OMB_AUTHOR_AVATAR_META = 'omb_author_avatar_id';

/** @return list<string> */
function omb_author_social_meta_keys(): array {
    return ['omb_author_facebook', 'omb_author_instagram', 'omb_author_linkedin'];
}

function omb_author_sanitize_social_url(string $raw): string {
    $t = trim($raw);
    if ($t === '' || $t === '#') {
        return '';
    }
    $u = esc_url_raw($t);

    return is_string($u) && $u !== '' ? $u : '';
}

function omb_author_sanitize_avatar_id(mixed $raw): int {
    $id = (int) $raw;
    if ($id < 1) {
        return 0;
    }
    if (get_post_type($id) !== 'attachment') {
        return 0;
    }

    return $id;
}

/** @return string Full-size image URL or empty. */
function omb_author_avatar_url_for_user(int $user_id): string {
    $id = (int) get_user_meta($user_id, OMB_AUTHOR_AVATAR_META, true);
    if ($id < 1) {
        return '';
    }
    $url = wp_get_attachment_image_url($id, 'full');

    return is_string($url) && $url !== '' ? $url : '';
}

function omb_author_profile_enqueue_media(string $hook): void {
    if (!in_array($hook, ['profile.php', 'user-edit.php'], true)) {
        return;
    }
    wp_enqueue_media();
}

add_action('admin_enqueue_scripts', 'omb_author_profile_enqueue_media');

function omb_author_profile_render_fields(WP_User $user): void {
    if (!current_user_can('edit_user', $user->ID)) {
        return;
    }

    $avatar_id = (int) get_user_meta($user->ID, OMB_AUTHOR_AVATAR_META, true);
    $avatar_url = $avatar_id > 0 ? omb_author_avatar_url_for_user((int) $user->ID) : '';
    $facebook = (string) get_user_meta($user->ID, 'omb_author_facebook', true);
    $instagram = (string) get_user_meta($user->ID, 'omb_author_instagram', true);
    $linkedin = (string) get_user_meta($user->ID, 'omb_author_linkedin', true);
    ?>
    <h2><?php esc_html_e('Salonora author card (headless)', 'omb-headless-core'); ?></h2>
    <p class="description">
        <?php esc_html_e('Shown in the blog and case study sidebar (“Over de auteur”). Biographical Info above is used for the bio text.', 'omb-headless-core'); ?>
    </p>
    <table class="form-table" role="presentation">
        <tr>
            <th><label for="omb_author_avatar_id"><?php esc_html_e('Profile photo', 'omb-headless-core'); ?></label></th>
            <td>
                <input type="hidden" id="omb_author_avatar_id" name="omb_author_avatar_id" value="<?php echo esc_attr((string) $avatar_id); ?>" />
                <div id="omb-author-avatar-preview" style="margin-bottom:8px;">
                    <?php if ($avatar_url !== '') : ?>
                        <img src="<?php echo esc_url($avatar_url); ?>" alt="" style="width:89px;height:89px;border-radius:50%;object-fit:cover;" />
                    <?php endif; ?>
                </div>
                <button type="button" class="button" id="omb-author-avatar-select"><?php esc_html_e('Select image', 'omb-headless-core'); ?></button>
                <button type="button" class="button" id="omb-author-avatar-remove" <?php echo $avatar_id > 0 ? '' : 'style="display:none;"'; ?>>
                    <?php esc_html_e('Remove', 'omb-headless-core'); ?>
                </button>
            </td>
        </tr>
        <tr>
            <th><label for="omb_author_facebook"><?php esc_html_e('Facebook URL', 'omb-headless-core'); ?></label></th>
            <td>
                <input type="url" class="regular-text code" id="omb_author_facebook" name="omb_author_facebook" value="<?php echo esc_attr($facebook); ?>" placeholder="https://" />
            </td>
        </tr>
        <tr>
            <th><label for="omb_author_instagram"><?php esc_html_e('Instagram URL', 'omb-headless-core'); ?></label></th>
            <td>
                <input type="url" class="regular-text code" id="omb_author_instagram" name="omb_author_instagram" value="<?php echo esc_attr($instagram); ?>" placeholder="https://" />
            </td>
        </tr>
        <tr>
            <th><label for="omb_author_linkedin"><?php esc_html_e('LinkedIn URL', 'omb-headless-core'); ?></label></th>
            <td>
                <input type="url" class="regular-text code" id="omb_author_linkedin" name="omb_author_linkedin" value="<?php echo esc_attr($linkedin); ?>" placeholder="https://" />
            </td>
        </tr>
    </table>
    <script>
    (function () {
        var frame;
        var input = document.getElementById('omb_author_avatar_id');
        var preview = document.getElementById('omb-author-avatar-preview');
        var removeBtn = document.getElementById('omb-author-avatar-remove');
        if (!input || !preview) return;

        function setPreview(url) {
            preview.innerHTML = url
                ? '<img src="' + url + '" alt="" style="width:89px;height:89px;border-radius:50%;object-fit:cover;" />'
                : '';
            if (removeBtn) removeBtn.style.display = url ? '' : 'none';
        }

        document.getElementById('omb-author-avatar-select')?.addEventListener('click', function (e) {
            e.preventDefault();
            if (frame) {
                frame.open();
                return;
            }
            frame = wp.media({
                title: <?php echo wp_json_encode(__('Select profile photo', 'omb-headless-core')); ?>,
                button: { text: <?php echo wp_json_encode(__('Use this image', 'omb-headless-core')); ?> },
                library: { type: 'image' },
                multiple: false
            });
            frame.on('select', function () {
                var attachment = frame.state().get('selection').first().toJSON();
                input.value = attachment.id || '';
                setPreview(attachment.url || '');
            });
            frame.open();
        });

        removeBtn?.addEventListener('click', function (e) {
            e.preventDefault();
            input.value = '';
            setPreview('');
        });
    })();
    </script>
    <?php
}

add_action('show_user_profile', 'omb_author_profile_render_fields');
add_action('edit_user_profile', 'omb_author_profile_render_fields');

function omb_author_profile_save(int $user_id): void {
    if (!current_user_can('edit_user', $user_id)) {
        return;
    }

    $avatar_id = isset($_POST['omb_author_avatar_id'])
        ? omb_author_sanitize_avatar_id(wp_unslash($_POST['omb_author_avatar_id']))
        : 0;

    if ($avatar_id > 0) {
        update_user_meta($user_id, OMB_AUTHOR_AVATAR_META, $avatar_id);
    } else {
        delete_user_meta($user_id, OMB_AUTHOR_AVATAR_META);
    }

    $social_map = [
        'omb_author_facebook' => isset($_POST['omb_author_facebook']) ? (string) wp_unslash($_POST['omb_author_facebook']) : '',
        'omb_author_instagram' => isset($_POST['omb_author_instagram']) ? (string) wp_unslash($_POST['omb_author_instagram']) : '',
        'omb_author_linkedin' => isset($_POST['omb_author_linkedin']) ? (string) wp_unslash($_POST['omb_author_linkedin']) : '',
    ];

    foreach ($social_map as $meta_key => $raw) {
        $url = omb_author_sanitize_social_url($raw);
        if ($url !== '') {
            update_user_meta($user_id, $meta_key, $url);
        } else {
            delete_user_meta($user_id, $meta_key);
        }
    }
}

add_action('personal_options_update', 'omb_author_profile_save');
add_action('edit_user_profile_update', 'omb_author_profile_save');
