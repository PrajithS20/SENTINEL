import TopBar from "../components/TopBar";
import MyGrowthTree from "../components/MyGrowthTree";
import ServicesList from "../components/ServicesList";
import LiveFeeds from "../components/LiveFeeds";

export default function Dashboard() {
  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/assets/forest_bg.png')" }}
    >
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <TopBar />

        <div className="flex flex-1 gap-6 p-6">
          {/* CENTER - Growth Tree + Services List */}
          <div className="flex-1">
            <div className="flex flex-col items-center mb-12">
              <div className="bg-gradient-to-br from-[#0B1220] to-black rounded-2xl p-8 flex flex-col items-center border border-gray-800 max-w-md w-full mb-8">
                <MyGrowthTree />
              </div>

              <div className="w-full">
                <h2 className="text-2xl font-bold text-neon mb-6 text-center">Our Services</h2>
                <ServicesList />
              </div>
            </div>
          </div>


          {/* RIGHT */}
          <div className="w-80">
            <LiveFeeds />
          </div>
        </div>
      </div>
    </div>
  );
}
