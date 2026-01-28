import { useParams } from "react-router-dom";
import RoomEdit from "./RoomEdit";

export default function RoomEditRoute() {
  const { slug } = useParams();
  return <RoomEdit slug={slug} />;
}