function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background cube-bg min-h-screen flex flex-col justify-between items-center">
      <div className="w-full flex h-[150px] items-center justify-center">
        <img src="/logo.svg" alt="logo" className="size-[50px]" />
      </div>
      <div className="w-full h-[calc(100vh-260px])] px-[5px] flex justify-center">
        {children}
      </div>
      <div className="h-[150px]"></div>
    </div>
  );
}

export default Layout;
