import { Link } from 'react-router-dom'
import Workspace from '../../components/Workspace'
export default function NotFound() { return <Workspace group="guest" title="Không tìm thấy trang"><div className="not-found"><h1>Không tìm thấy trang</h1><p>Đường dẫn bạn mở không tồn tại.</p><Link className="button primary" to="/">Về trang chủ</Link></div></Workspace> }
