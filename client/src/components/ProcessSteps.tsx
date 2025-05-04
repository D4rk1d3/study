export type Step = {
  number: number;
  title: string;
  subtitle?: string;
};

interface ProcessStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function ProcessSteps({ steps, currentStep }: ProcessStepsProps) {
  return (
    <div className="mb-8">
      <ol className="flex flex-wrap items-center w-full text-sm font-medium text-center text-gray-500 sm:flex-nowrap">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isPast = step.number < currentStep;
          
          // Determine text color class based on step status
          const textColorClass = isActive 
            ? "text-primary-600" 
            : isPast 
              ? "text-gray-700" 
              : "text-gray-500";

          return (
            <li
              key={step.number}
              className={`flex ${
                index !== steps.length - 1
                  ? "md:w-full items-center sm:after:content-[''] sm:after:w-full sm:after:h-1 sm:after:border-b sm:after:border-gray-200 sm:after:border-1 sm:after:hidden sm:after:mx-6 xl:after:mx-10"
                  : "items-center"
              }`}
            >
              <span
                className={`flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 ${textColorClass}`}
              >
                <span className="mr-2">{step.number}</span> {step.title}{" "}
                <span className="hidden sm:inline-flex sm:ml-2">
                  {step.subtitle}
                </span>
                {index !== steps.length - 1 && (
                  <svg
                    className="w-4 h-4 ml-2 hidden sm:inline-flex"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
