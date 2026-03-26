import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="loader-bar">
        <div className="loader-ball" />
      </div>
    </div>
  );
};

export default Loader;
