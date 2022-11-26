import React from 'react';
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div>App</div>
    </MantineProvider>
  );
}

export default App;
