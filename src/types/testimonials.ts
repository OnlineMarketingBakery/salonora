export type TestimonialDocument = {
  id: number;
  clientName: string;
  clientRole: string;
  clientTestimonial: string;
  rating: number | null;
  avatar: import("./wordpress").WpImage | null;
};
