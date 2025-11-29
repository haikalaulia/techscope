import { DivProps } from "@/types/ui";

const View: React.FC<DivProps> = ({
  as: Tag = "view",
  children,
  className,
}) => {
  return <Tag className={className}>{children}</Tag>;
};

export default View;
