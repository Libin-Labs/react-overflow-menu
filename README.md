# @lp-labs/react-overflow-menu

Measured action toolbars that move excess buttons into a keyboard-driven menu. React 18+ peer only; native ResizeObserver with window-resize fallback. ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-overflow-menu
```

## Quick Start

```jsx
import { OverflowMenu } from '@lp-labs/react-overflow-menu';
export default function Example() {
  return (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <OverflowMenu
        actions={[
          { id: 'save', label: 'Save', onSelect: () => console.log('Save') },
          { id: 'export', label: 'Export report', onSelect: () => console.log('Export') },
          { id: 'settings', label: 'Settings', onSelect: () => console.log('Settings') },
        ]}
      />
    </div>
  );
}
```

## API

Actions have unique id, presentational label, onSelect():void|Promise<void> and optional disabled. Props: actions, gap=8, label='Actions', moreLabel='More actions', className. Hidden noninteractive measurement copies determine widths; ResizeObserver updates placement. Toolbar Left/Right/Home/End move focus. More/ArrowDown opens the menu; Up/Down/Home/End navigate, Escape closes and restores focus; Tab leaves. Async actions lock execution and expose rejected errors.

## Benefits

| Area                | Details                                                     |
| ------------------- | ----------------------------------------------------------- |
| Responsive actions  | Measure available width and retain overflowed actions.      |
| Accessible controls | Keep keyboard navigation through toolbar and overflow menu. |
| Async-safe actions  | Prevent duplicate invocation while an action is pending.    |

## Customization

| Area         | Details                                                    |
| ------------ | ---------------------------------------------------------- |
| Measurement  | Configure actions, gap, labels, and parent width.          |
| Actions      | Set ID, label, disabled state, and callback.               |
| Presentation | Customize class name; menu uses native in-place rendering. |

## Security And Limits

At most 100 actions; gap: 0–100 pixels. Give the parent a finite measurable width. SSR initially renders all actions; measurement happens after mount. The menu renders in place, not in a portal; ancestor clipping can affect it. No arbitrary HTML injection, command lookup, network transport or authorization is performed. Labels must not contain interactive descendants. The window-resize fallback cannot detect all container-only changes where ResizeObserver is absent. Test resizing and keyboard focus with your own responsive CSS and fonts.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
