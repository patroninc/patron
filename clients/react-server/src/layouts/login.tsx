function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background cube-bg flex min-h-screen flex-col items-center justify-between">
      <div className="flex h-[150px] w-full items-center justify-center">
        <img src="/logo.svg" alt="logo" className="size-[50px]" />
      </div>
      <div className="flex h-[calc(100vh-260px])] w-full justify-center px-[5px]">{children}</div>
      <div className="h-[150px]"></div>
    </div>
  );
}

export default Layout;
