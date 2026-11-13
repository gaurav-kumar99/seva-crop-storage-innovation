import { FiInfo } from "react-icons/fi";

function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <FiInfo aria-hidden="true" /> Competition prototype: storage listings and
      prices are sample data, not real facilities.
    </div>
  );
}

export default DemoBanner;