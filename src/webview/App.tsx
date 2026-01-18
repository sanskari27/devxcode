import { Section } from '@components/atoms';
import { Dumps, Releases, Repositories, Todos } from '@components/templates';
import { default as React } from 'react';

const App: React.FC = () => {
  // VS Code webviews automatically provide CSS variables like --vscode-editor-background
  // These are used directly in CSS, so no need to set them manually here

  return (
    <div className="w-full h-full m-0 p-0">
      <Todos />
      <Repositories />
      <Releases />
      <Section title="Utilities" />
      <Section title="Git Helpers" />
      <Dumps />
      <Section title="Knowledge Base" />
    </div>
  );
};

export default App;
