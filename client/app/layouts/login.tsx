function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background cube-bg h-screen flex justify-center items-center">
      <div className="w-full flex justify-center fixed left-0 top-10">
        <img src="/logo.svg" alt="logo" className="size-[50px]" />
      </div>
      {children}
    </div>
  );
}

export default Layout;
