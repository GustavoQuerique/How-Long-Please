export default function TimeInput({ label, value, onChange, description }) {
    return (
        <div className="card stat-card">
            <label className="form-label">
                {label}
            </label>

            <input className="form"
                type="time"
                value={value}
                onChange={onChange}
            />

            <p className="stat-description">
                {description}
            </p>
        </div>
    );
}