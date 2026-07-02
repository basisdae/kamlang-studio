import { notFound } from "next/navigation";
import AppShell from "../../../components/layout/AppShell";
import { getRecipeBySlug } from "../RecipeRepository";
import { getRecipeReferencePrice } from "../../lib/costService";
import RecipeHero from "./components/RecipeHero";
import RecipeScaledSections from "./components/RecipeScaledSections";
import RecipeNotes from "./components/RecipeNotes";
import RecipeActionBar from "./components/RecipeActionBar";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const suggestedPrice = getRecipeReferencePrice(recipe);

  return (
    <AppShell title={recipe.name} description={recipe.category} backHref="/recipes">
      <div className="space-y-7 kl-scroll-above-bottom-bar">
        <RecipeHero recipe={recipe} />
        <RecipeScaledSections
          recipeId={recipe.id}
          recipeName={recipe.name}
          recipeCategory={recipe.category}
          lines={recipe.lines}
          yieldUnit={recipe.yieldUnit}
          suggestedPrice={suggestedPrice}
        />
        <RecipeNotes notes={recipe.description} />
      </div>
      <RecipeActionBar />
    </AppShell>
  );
}
