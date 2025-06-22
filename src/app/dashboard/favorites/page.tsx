export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground">Your most-loved restaurants and meals.</p>
      </header>
      <div className="flex items-center justify-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
          <p>Your favorite items will appear here.</p>
      </div>
    </div>
  );
}
