import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@/app.css';

import { ReactNode } from 'react';
import { Provider } from 'jotai';
import { MantineProvider } from '@mantine/core';

export const metadata = {
  title: 'MTA Dashboard',
  description: 'MTA Capital Program Dashboard',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <base href="/" />
      </head>
      <body>
        <div id="root">
          <Provider>
            <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
          </Provider>
        </div>
      </body>
    </html>
  );
}
