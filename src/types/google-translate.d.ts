interface Window {
  google?: {
    translate: {
      TranslateElement: new (config: any, elementId: string) => void;
    };
  };
  googleTranslateElementInit?: () => void;
}
