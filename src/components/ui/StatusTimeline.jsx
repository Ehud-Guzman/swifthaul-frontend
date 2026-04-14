import { Check } from 'lucide-react';

const STEPS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STEPS.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
        Job Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const label = step.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 whitespace-nowrap font-medium ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mx-1 mb-4 transition-colors ${i < currentIndex ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
