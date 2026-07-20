import NavBar from "@/components/UI/navbar";

const LandingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
};

export default LandingLayout;
