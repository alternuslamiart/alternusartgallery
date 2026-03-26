export interface Artist {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  specialties: string[];
  yearsActive: number;
  totalArtworks: number;
  soldArtworks: number;
  followers: number;
}

export const artists: Artist[] = [
  {
    id: "1",
    name: "Lamiart",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    coverImage: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80",
    bio: "Lamiart is a contemporary artist known for blending abstract expressionism with modern digital techniques. With over a decade of experience, their work has been featured in galleries across Europe and North America. Inspired by nature, emotion, and the human experience, Lamiart creates pieces that speak to the soul.",
    location: "Paris, France",
    website: "https://lamiart.com",
    instagram: "@lamiart",
    twitter: "@lamiart",
    specialties: ["Abstract", "Contemporary", "Mixed Media"],
    yearsActive: 12,
    totalArtworks: 156,
    soldArtworks: 89,
    followers: 12400,
  },
  {
    id: "2",
    name: "Marco Rossi",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80",
    bio: "Marco Rossi is an Italian artist specializing in landscape and urban art. Born in Florence, Marco's work reflects his deep connection to Italian architecture and countryside. His paintings capture the essence of place and time with masterful use of light and shadow.",
    location: "Florence, Italy",
    instagram: "@marcorossiart",
    specialties: ["Landscape", "Urban", "Realism"],
    yearsActive: 8,
    totalArtworks: 94,
    soldArtworks: 62,
    followers: 8900,
  },
  {
    id: "3",
    name: "Sofia Chen",
    avatar: "https://randomuser.me/api/portraits/women/57.jpg",
    coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
    bio: "Sofia Chen is a Chinese-American artist known for her vibrant abstract works that explore themes of identity, culture, and transformation. Her unique style combines Eastern philosophy with Western modernism, creating a visual language that transcends borders.",
    location: "New York, USA",
    website: "https://sofiachen.art",
    instagram: "@sofiachen_art",
    twitter: "@sofiachenart",
    specialties: ["Abstract", "Contemporary", "Cultural Fusion"],
    yearsActive: 15,
    totalArtworks: 203,
    soldArtworks: 145,
    followers: 24600,
  },
];

export function getArtistById(id: string): Artist | undefined {
  return artists.find((artist) => artist.id === id);
}

export function getArtistByName(name: string): Artist | undefined {
  return artists.find((artist) => artist.name.toLowerCase() === name.toLowerCase());
}
