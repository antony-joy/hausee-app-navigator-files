import * as React from 'react';

export default function DebugInput() {
  const [value, setValue] = React.useState('');

  console.log('DebugInput render');

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: 8, border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: 8 }}>Value: {value}</div>
    </div>
  );
}
