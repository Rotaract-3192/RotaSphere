export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  organizer: string;
  price: string;
  category: string;
  capacity: string;
  attendees: number;
  type?: 'free' | 'paid';
  ticketId?: string;
  ticketCode?: string;
  pricePaid?: number | string;
  status?: string;
  purchasedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  slug: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: string;
}

export const mockCategories: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Community Service",
    icon: "Heart",
    description: "Humanitarian aids, environmental drives, blood donations, and local community outreach.",
    count: 24,
    slug: "community"
  },
  {
    id: "cat-2",
    name: "Professional Development",
    icon: "Briefcase",
    description: "Leadership workshops, career guidance panels, skills training, and speaker sessions.",
    count: 18,
    slug: "professional"
  },
  {
    id: "cat-3",
    name: "Club Service",
    icon: "Users",
    description: "Club meetings, fellowships, socials, installation ceremonies, and internal bonding.",
    count: 15,
    slug: "club"
  },
  {
    id: "cat-4",
    name: "International Service",
    icon: "Globe",
    description: "Global joint projects, sister-club partnerships, peace webinars, and exchange programs.",
    count: 8,
    slug: "international"
  },
  {
    id: "cat-5",
    name: "Fundraisers",
    icon: "DollarSign",
    description: "Charity runs, benefit galas, donation drives, and fundraising concerts for social causes.",
    count: 12,
    slug: "fundraiser"
  },
  {
    id: "cat-6",
    name: "Public Relations",
    icon: "Sparkles",
    description: "Orientation events, membership drives, public walks, and Rotaract awareness seminars.",
    count: 6,
    slug: "pr"
  }
];

export const mockEvents: EventItem[] = [
  {
    id: "evt-1",
    title: "NextGen Tech Summit 2026",
    description: "Join industry leaders and visionaries as we explore the future of AI, Web3, and quantum computing. A 3-day immersive experience featuring hands-on labs and panels.",
    date: "June 15, 2026",
    time: "09:00 AM - 05:00 PM EST",
    location: "San Francisco Innovation Center, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "NextGen Tech Group",
    price: "$299.00",
    category: "professional",
    capacity: "1500",
    attendees: 1240
  },
  {
    id: "evt-2",
    title: "Decibel Music Festival 2026",
    description: "Experience the ultimate electronic and indie music festival. Multi-stage performances, laser light installations, food trucks, and camping experiences.",
    date: "July 24-26, 2026",
    time: "02:00 PM - Midnight EST",
    location: "Whispering Pines Park, Austin, TX",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "Decibel Entertainment",
    price: "$149.00",
    category: "fundraiser",
    capacity: "5000",
    attendees: 4200
  },
  {
    id: "evt-3",
    title: "SaaS Growth & Startup Expo",
    description: "Learn scaling secrets, fundraising masterclasses, and product-led growth strategies from successful founders who bootstrapped to millions.",
    date: "August 12, 2026",
    time: "10:00 AM - 06:00 PM EST",
    location: "Metropolitan Convention Hall, NY",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "SaaS Builders Network",
    price: "$199.00",
    category: "professional",
    capacity: "800",
    attendees: 642
  },
  {
    id: "evt-4",
    title: "Global Food & Wine Festival",
    description: "Savor delicacies prepared by Michelin-starred chefs and taste fine wines from renowned vineyards globally. Includes masterclasses on pairing.",
    date: "September 05, 2026",
    time: "11:00 AM - 09:00 PM PST",
    location: "Napa Valley Vineyards, CA",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "Culinary Arts Association",
    price: "$85.00",
    category: "club",
    capacity: "1000",
    attendees: 890
  },
  {
    id: "evt-5",
    title: "Metropolitan Art & Design Week",
    description: "Discover spectacular visual installations, contemporary sculptures, and digital art creations from upcoming designers and sculptors.",
    date: "October 18-22, 2026",
    time: "10:00 AM - 08:00 PM EST",
    location: "Museum of Modern Art, Chicago, IL",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "Modern Art Coalition",
    price: "Free (RSVP Req.)",
    category: "pr",
    capacity: "2000",
    attendees: 1650
  },
  {
    id: "evt-6",
    title: "ActiveLife Marathon & Wellness Expo",
    description: "Challenge your boundaries with our annual 21K marathon, and browse wellness booths offering organic foods, activewear, and therapy guides.",
    date: "November 08, 2026",
    time: "06:00 AM - 02:00 PM PST",
    location: "Waterfront Park, Seattle, WA",
    image: "https://images.unsplash.com/photo-1502904582529-0a1514896a2e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    organizer: "ActiveLife Foundation",
    price: "$45.00",
    category: "community",
    capacity: "3000",
    attendees: 2100
  }
];

export const mockTestimonials: TestimonialItem[] = [
  {
    id: "t-1",
    name: "Sarah Jenkins",
    role: "VP of Events",
    company: "TechGlobal Inc.",
    content: "Switching our corporate summit hosting to RotaSphere was a game changer. The glassmorphic interface is stunningly beautiful, and managing 2,000+ tickets was completely seamless.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5
  },
  {
    id: "t-2",
    name: "Marcus Vance",
    role: "Founder & Producer",
    company: "Decibel Records",
    content: "The customization options on RotaSphere are incredible. We were able to configure beautiful custom event badges and email invitations in minutes. The smooth user flows drive higher sales.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5
  },
  {
    id: "t-3",
    name: "Elena Rostova",
    role: "Community Director",
    company: "Impact Hub",
    content: "The statistics dashboard provides exact, real-time insights into attendance and ticket revenue. RotaSphere's light and dark styling is premium and fits our modern brand perfectly.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5
  }
];

export const mockStats: StatItem[] = [
  {
    id: "st-1",
    value: "12k+",
    label: "Events Hosted",
    icon: "Calendar"
  },
  {
    id: "st-2",
    value: "450k+",
    label: "Tickets Sold",
    icon: "Ticket"
  },
  {
    id: "st-3",
    value: "99.9%",
    label: "Platform Uptime",
    icon: "ShieldCheck"
  },
  {
    id: "st-4",
    value: "4.9/5",
    label: "Host Satisfaction",
    icon: "Star"
  }
];
