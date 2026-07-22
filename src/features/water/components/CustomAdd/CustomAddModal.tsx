interface CustomAddModalProps {
  onClose?: () => void;
  onConfirm?: (ml: number) => void;
}

export const CustomAddModal = ({onClose, onConfirm}: CustomAddModalProps) => {
  console.log(onClose, onConfirm);

  return <></>;
};
