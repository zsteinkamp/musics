import moment from "moment";
import Link from "next/link";

type TimestampProps = {
  timestamp: Date
  className?: String
};

const Timestamp = ({
  timestamp,
  className,
}: TimestampProps): JSX.Element | null => {
  const timeStr = moment(timestamp).format("YYYY-MM-DD HH:mm");
  return <p className={`text-xs ${className}`} suppressHydrationWarning>{timeStr}</p>
}

export default Timestamp