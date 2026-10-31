import Workspace from '../components/Workspace';

export default function GuestLayout({ title, children }) {
  return (
    <Workspace group="guest" title={title}>
      {children}
    </Workspace>
  );
}
