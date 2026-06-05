export default function Loading() {
  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-purple-500 font-medium" style={{ fontFamily: "Syne, sans-serif" }}>Loading...</p>
      </div>
    </div>
  );
}
