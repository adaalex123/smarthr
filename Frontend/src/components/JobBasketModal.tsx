import { Link } from 'react-router-dom'

interface SavedJob {
  id: string
  title: string
  location: string
  salary: string
  type: string
}

interface JobBasketModalProps {
  isOpen: boolean
  onClose: () => void
  savedJobs: SavedJob[]
  onRemoveItem?: (id: string) => void
  onClearAll?: () => void
}

export default function JobBasketModal({
  isOpen,
  onClose,
  savedJobs,
  onRemoveItem,
  onClearAll,
}: JobBasketModalProps) {
  if (!isOpen) return null

  return (
    <div className="tf-modal-backdrop" onClick={onClose}>
      <div className="tf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tf-modal-header">
          <div className="title-row">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16l-1.5 12h-13L4 8z" />
              <path d="M9 8V5a3 3 0 0 1 6 0v3" />
            </svg>
            <h3>Job Basket ({savedJobs.length})</h3>
          </div>
          <button className="tf-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tf-modal-body">
          {savedJobs.length === 0 ? (
            <div className="tf-empty-basket">
              <div className="basket-icon-placeholder">🧺</div>
              <p>Your job basket is currently empty.</p>
              <span className="sub-text">Click <strong>+ ADD</strong> on any job card to save it to your basket for quick application.</span>
            </div>
          ) : (
            <div className="tf-basket-list">
              {savedJobs.map((job) => (
                <div key={job.id} className="tf-basket-item">
                  <div className="item-details">
                    <h4>{job.title}</h4>
                    <div className="item-meta">
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                      <span className="type-tag">{job.type}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <Link to={`/jobs/${job.id}/apply`} className="apply-btn" onClick={onClose}>
                      Apply Now
                    </Link>
                    {onRemoveItem && (
                      <button className="remove-btn" onClick={() => onRemoveItem(job.id)} title="Remove">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {savedJobs.length > 0 && (
          <div className="tf-modal-footer">
            {onClearAll && (
              <button className="clear-all-btn" onClick={onClearAll}>
                Clear Basket
              </button>
            )}
            <Link to="/signup" className="apply-all-btn" onClick={onClose}>
              Proceed to Apply ({savedJobs.length}) →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
