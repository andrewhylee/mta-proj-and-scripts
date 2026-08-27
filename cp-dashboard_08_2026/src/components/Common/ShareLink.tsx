import React, { useState } from 'react';
import { IconShare3 } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';


const ShareLink = () => {
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = async () => {
    try {                  
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess('Copied!');
    } catch (err) {
      setCopySuccess('Failed to copy!');
    } finally {
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div>
      <Tooltip
        label={copySuccess || 'Copy link to clipboard'}
        withArrow
        style={{ color: 'var(--white-color)', background: 'var(--blue-color)' }}
        position="left"
        offset={1}
        opened={copySuccess ? true : undefined}
      >
        <button type="button" onClick={() => copyToClipboard()} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }}>
          <IconShare3
            style={{ color: 'var(--blue-color)' }}
            size={20}
          />
        </button>
      </Tooltip>
    </div>
  );
};

export default ShareLink;