import { JSX, useState } from 'react';

/**
 * Demonstration card with a local counter.
 *
 * @returns {JSX.Element} Interactive counter card.
 */
function Card(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div className="card">
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
  );
}

export default Card;
