interface Props {
    label: string;
    onPrev: () => void;
    onToday: () => void;
    onNext: () => void;
    isPrevDisabled: boolean;
    isTodayDisabled: boolean;
    isNextDisabled: boolean;
}

const DateNavigator = ({ label, onPrev, onToday, onNext, isPrevDisabled, isTodayDisabled, isNextDisabled }: Props) => {
    return (
        <div className="flex items-center gap-6 mb-8">
            <button
                onClick={onPrev}
                disabled={isPrevDisabled}
                className="text-2xl px-2 text-gray-600 hover:text-gray-900 cursor-pointer select-none transition disabled:opacity-30 disabled:cursor-default disabled:hover:text-gray-600"
                aria-label="Previous"
            >
                ←
            </button>

            <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-gray-800 select-none">{label}</span>

                <button
                    onClick={onToday}
                    disabled={isTodayDisabled}
                    className={`text-xs mt-1 font-medium transition select-none
                        ${
                            isTodayDisabled
                                ? 'text-gray-300 cursor-default'
                                : 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline'
                        }`}
                >
                    Today
                </button>
            </div>

            <button
                onClick={onNext}
                disabled={isNextDisabled}
                className="text-2xl px-2 text-gray-600 hover:text-gray-900 cursor-pointer select-none transition disabled:opacity-30 disabled:cursor-default disabled:hover:text-gray-600"
                aria-label="Next"
            >
                →
            </button>
        </div>
    );
};

export default DateNavigator;
