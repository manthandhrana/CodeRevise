import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Page not found</h1>
      <p>The topic or page you are looking for does not exist (yet).</p>
      <Link to="/" className="btn primary">Back to home</Link>
    </div>
  )
}
