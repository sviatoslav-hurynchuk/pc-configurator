import {
    BsCpu, BsMotherboard, BsGpuCard, BsMemory,
    BsDeviceHdd, BsDeviceSsd, BsFan, BsLightningCharge,
    BsDroplet, BsEyedropper, BsPc, BsWind, BsUsbPlug, BsWrenchAdjustable
} from "react-icons/bs";

export const PC_CATEGORIES = [
    { id: 1, name: 'Процесор', icon: <BsCpu size={34} /> },
    { id: 2, name: 'Материнська плата', icon: <BsMotherboard size={34} /> },
    { id: 3, name: 'Відеокарта', icon: <BsGpuCard size={34} /> },
    { id: 4, name: "Модулі пам'яті", icon: <BsMemory size={34} /> },
    { id: 5, name: 'SSD диск', icon: <BsDeviceSsd size={34} /> },
    { id: 6, name: 'HDD диск', icon: <BsDeviceHdd size={34} /> },
    { id: 7, name: 'Система охолодження', icon: <BsFan size={34} /> },
    { id: 8, name: 'Водяне охолодження', icon: <BsDroplet size={34} /> },
    { id: 9, name: 'Термопаста', icon: <BsEyedropper size={34} /> },
    { id: 10, name: 'Блок живлення', icon: <BsLightningCharge size={34} /> },
    { id: 11, name: 'Корпус', icon: <BsPc size={34} /> },
    { id: 12, name: 'Корпусний вентилятор', icon: <BsWind size={34} /> },
    { id: 13, name: 'Кастомні кабелі живлення', icon: <BsUsbPlug size={34} /> },
    { id: 14, name: 'Тримачі до відеокарт', icon: <BsWrenchAdjustable size={34} /> }
];