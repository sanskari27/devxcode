import { createRoot, Root } from 'react-dom/client';
import { AlertComponent } from './Alert';

export type InputType =
  | 'text'
  | 'date'
  | 'email'
  | 'number'
  | 'password'
  | 'tel'
  | 'url'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'search'
  | 'color';

export interface AlertInput {
  id: string;
  placeholder: string;
  type: InputType;
}

export interface AlertButton {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  handler: (values: Record<string, string>) => void;
}

interface AlertConfig {
  title?: string;
  description?: string;
  inputs: AlertInput[];
  buttons: AlertButton[];
}

class AlertBuilder {
  private config: AlertConfig = {
    inputs: [],
    buttons: [],
  };

  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  static title(text: string): AlertBuilder {
    const builder = new AlertBuilder();
    builder.config.title = text;
    return builder;
  }

  description(text: string): AlertBuilder {
    this.config.description = text;
    return this;
  }

  addInput(
    placeholder: string,
    name: string,
    type: InputType = 'text'
  ): AlertBuilder {
    const input: AlertInput = {
      id: name,
      placeholder,
      type,
    };
    this.config.inputs.push(input);
    return this;
  }

  addButton(
    type: 'primary' | 'secondary',
    text: string,
    handler: (values: Record<string, string>) => void
  ): AlertBuilder {
    const button: AlertButton = {
      id: `alert-button-${Date.now()}-${Math.random()}`,
      type,
      text,
      handler,
    };
    this.config.buttons.push(button);
    return this;
  }

  show() {
    // Create container for portal
    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    // Create React root and render
    this.root = createRoot(this.container);
    this.root.render(
      <AlertComponent
        title={this.config.title}
        description={this.config.description}
        inputs={this.config.inputs}
        buttons={this.config.buttons}
        onClose={() => this.close()}
      />
    );

    // Return close function
    return () => this.close();
  }

  private close(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
    // Reset config for potential reuse
    this.config = {
      inputs: [],
      buttons: [],
    };
  }
}

export { AlertBuilder };
