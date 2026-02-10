import { FiMoon, FiSun } from 'react-icons/fi';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ColorScheme, ColorTheme, ColorThemeOption } from '@/types';

interface AppHeaderProps {
  colorTheme: ColorTheme;
  colorThemeOptions: ColorThemeOption[];
  colorScheme: ColorScheme;
  onThemeChange: (value: string) => void;
  onColorSchemeCheckedChange: (checked: boolean) => void;
}

export function AppHeader({ colorTheme, colorThemeOptions, colorScheme, onThemeChange, onColorSchemeCheckedChange }: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold md:text-3xl">小学计算题生成器</h1>
        <p className="text-muted-foreground text-sm">可配置运算符、数字范围，支持 PDF 预览、打印与 Word 导出。</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Label htmlFor="theme-color-select" className="text-muted-foreground text-xs">
            主题色
          </Label>
          <Select value={colorTheme} onValueChange={onThemeChange}>
            <SelectTrigger id="theme-color-select" className="w-36" size="sm" aria-label="切换主题颜色">
              <SelectValue placeholder="选择主题色" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {colorThemeOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <FiSun className={colorScheme === 'light' ? 'text-foreground' : 'text-muted-foreground'} />
          <Switch aria-label="切换明暗模式" checked={colorScheme === 'dark'} onCheckedChange={onColorSchemeCheckedChange} />
          <FiMoon className={colorScheme === 'dark' ? 'text-foreground' : 'text-muted-foreground'} />
        </div>
      </div>
    </header>
  );
}
