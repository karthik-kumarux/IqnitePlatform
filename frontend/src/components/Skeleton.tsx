import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  style = {},
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
};

export const QuizCardSkeleton: React.FC = () => {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '1rem',
    }}>
      <Skeleton width="60%" height="24px" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="40%" height="16px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="60px" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Skeleton width="80px" height="28px" borderRadius="20px" />
        <Skeleton width="80px" height="28px" borderRadius="20px" />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Skeleton width="100px" height="36px" borderRadius="6px" />
        <Skeleton width="100px" height="36px" borderRadius="6px" />
      </div>
    </div>
  );
};

export const QuizListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      {Array.from({ length: count }).map((_, index) => (
        <QuizCardSkeleton key={index} />
      ))}
    </>
  );
};

export const QuestionCardSkeleton: React.FC = () => {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <Skeleton width="70%" height="20px" />
        <Skeleton width="60px" height="24px" borderRadius="12px" />
      </div>
      <Skeleton width="100%" height="80px" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="100%" height="40px" borderRadius="6px" />
        <Skeleton width="100%" height="40px" borderRadius="6px" />
        <Skeleton width="100%" height="40px" borderRadius="6px" />
        <Skeleton width="100%" height="40px" borderRadius="6px" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '1rem',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}>
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton key={idx} height="20px" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1rem',
              padding: '1rem',
              borderBottom: rowIdx < rows - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} height="16px" />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <Skeleton width="250px" height="32px" style={{ marginBottom: '2rem' }} />
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <Skeleton width="100px" height="16px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="80px" height="36px" />
          </div>
        ))}
      </div>

      {/* Quiz List */}
      <Skeleton width="150px" height="24px" style={{ marginBottom: '1rem' }} />
      <QuizListSkeleton count={3} />
    </div>
  );
};
