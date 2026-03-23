export interface ProjectData {
  id: string;
  name: string;
  idea: string;
  createdAt: string;
  strategy: any; // The full JSON from AI
}

export interface SupabaseProject {
  id: string;
  user_id: string;
  name: string;
  idea: string;
  strategy_json: any;
  created_at: string;
}

export type GtmColumn = 'Positioning' | 'Product' | 'Promotion';

export interface GtmCard {
  id: string;
  column: GtmColumn;
  index: string; 
  title: string;
  description?: string;
  content: string;
}

export const MARKETING_QUOTES = [
  { 
    text: {
      EN: "The consumer isn't a moron; she is your wife.",
      FR: "Le consommateur n'est pas un idiot ; c'est votre femme."
    }, 
    author: "David Ogilvy" 
  },
  { 
    text: {
      EN: "People don't buy what you do; they buy why you do it.",
      FR: "Les gens n'achètent pas ce que vous faites ; ils achètent pourquoi vous le faites."
    }, 
    author: "Simon Sinek" 
  },
  { 
    text: {
      EN: "Don't find customers for your products, find products for your customers.",
      FR: "Ne cherchez pas des clients pour vos produits, cherchez des produits pour vos clients."
    }, 
    author: "Seth Godin" 
  },
  { 
    text: {
      EN: "We need to stop interrupting what people are interested in and be what people are interested in.",
      FR: "Nous devons arrêter d'interrompre ce qui intéresse les gens et devenir ce qui les intéresse."
    }, 
    author: "Craig Davis" 
  },
  { 
    text: {
      EN: "The man who stops advertising to save money is like the man who stops the clock to save time.",
      FR: "L'homme qui arrête la publicité pour économiser de l'argent est comme l'homme qui arrête l'horloge pour gagner du temps."
    }, 
    author: "Thomas Jefferson" 
  },
  { 
    text: {
      EN: "Good advertising does not just circulate information. It penetrates the public mind with desires and belief.",
      FR: "Une bonne publicité ne se contente pas de faire circuler l'information. Elle pénètre l'esprit du public avec des désirs et des convictions."
    }, 
    author: "Leo Burnett" 
  }
];
