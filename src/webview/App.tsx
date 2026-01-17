import React, { useEffect } from 'react';
import { Releases, Section } from './components';
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    if (theme?.colors) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, `var(${value})`);
      });
    }
  }, [theme]);

  return (
    <div
      className="w-full h-full m-0 p-0"
    >
      <Section title="Todo" defaultExpanded />
      <Section title="Repositories" defaultExpanded />
      <Releases />
      <Section title="Utilities" />
      <Section title="Git Helpers" />
      <Section title="Dumps" />
      <Section title="Knowledge Base" />
    </div>
  );
};

export default App;
