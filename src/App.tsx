import * as React from 'react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FiMoon, FiSun } from 'react-icons/fi';

const COLOR_SCHEME_STORAGE_KEY = 'koibito-color-scheme';
const THEME_STORAGE_KEY = 'koibito-theme';

const themes = [
  { value: 'neutral', label: 'Neutral', hue: 0, chroma: 0.02 },
  { value: 'amber', label: 'Amber', hue: 85 },
  { value: 'blue', label: 'Blue', hue: 240 },
  { value: 'cyan', label: 'Cyan', hue: 200 },
  { value: 'emerald', label: 'Emerald', hue: 150 },
  { value: 'fuchsia', label: 'Fuchsia', hue: 300 },
  { value: 'green', label: 'Green', hue: 140 },
  { value: 'indigo', label: 'Indigo', hue: 260 },
  { value: 'lime', label: 'Lime', hue: 110 },
  { value: 'orange', label: 'Orange', hue: 65 },
  { value: 'pink', label: 'Pink', hue: 330 },
  { value: 'red', label: 'Red', hue: 25 },
  { value: 'rose', label: 'Rose', hue: 350 },
  { value: 'sky', label: 'Sky', hue: 210 },
  { value: 'teal', label: 'Teal', hue: 170 },
  { value: 'violet', label: 'Violet', hue: 280 },
  { value: 'yellow', label: 'Yellow', hue: 95 },
];

function applyTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
}

export function App() {
  const [theme, setTheme] = React.useState<string>('cyan');
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = storedTheme || 'cyan';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  React.useEffect(() => {
    const storedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialScheme = storedScheme ?? (prefersDark ? 'dark' : 'light');
    setColorScheme(initialScheme);
    document.documentElement.classList.toggle('dark', initialScheme === 'dark');
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem(THEME_STORAGE_KEY, value);
    applyTheme(value);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Theme</h1>
            <p className="text-muted-foreground text-sm">Switch between shadcn/ui preset themes.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FiSun className={colorScheme === 'light' ? 'text-foreground' : 'text-muted-foreground'} />
            <Switch
              aria-label="Toggle color scheme"
              checked={colorScheme === 'dark'}
              onCheckedChange={(checked) => {
                const nextScheme = checked ? 'dark' : 'light';
                setColorScheme(nextScheme);
                localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, nextScheme);
                document.documentElement.classList.toggle('dark', nextScheme === 'dark');
              }}
            />
            <FiMoon className={colorScheme === 'dark' ? 'text-foreground' : 'text-muted-foreground'} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Color theme</label>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="border-border bg-primary text-primary-foreground flex h-9 w-14 items-center justify-center rounded-lg border text-xs font-medium"
              aria-label="Theme color preview"
              title="Theme color preview"
            >
              Aa
            </div>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Themes</SelectLabel>
                  {themes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <span
                        className="inline-flex size-2.5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `oklch(0.61 ${item.chroma ?? 0.11} ${item.hue})`,
                        }}
                      />
                      <span>{item.label}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
