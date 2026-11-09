import Workspace from '../components/Workspace';

export default function StudentLayout({ title, children }) {
  return <Workspace group="student" title={title}>{children}</Workspace>;
}
