import Workspace from '../components/Workspace';

export default function ManagerLayout({ title, children }) {
  return (
    <Workspace group="manager" title={title}>
      {children}
    </Workspace>
  );
}
