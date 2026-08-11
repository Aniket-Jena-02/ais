import { Gift } from 'lucide-react';

const GiftingBtn = () => {
    return (
        <button
            type="button"
            disabled
            title="Gifting coming soon"
            aria-label="Gifting coming soon"
            className="hidden sm:flex p-2 rounded-full text-white/15 transition-all disabled:cursor-not-allowed"
        >
            <Gift size={20} />
        </button>
    )
}

export default GiftingBtn