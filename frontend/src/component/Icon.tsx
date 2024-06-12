import Icon from '@ant-design/icons';
import {GetProps} from "antd";

type CustomIconComponentProps = GetProps<typeof Icon>;

const DecompileSvg = () => (
    <svg width="1em" height="1em" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1717">
        <path d="M512.630999 1023.99961a512.081882 512.081882 0 0 1-199.333887-983.655451A512.081882 512.081882 0 0 1 1023.074676 472.543558a36.659106 36.659106 0 1 1-73.100547 5.590514 438.660567 438.660567 0 1 0-127.161273 344.080074 36.659106 36.659106 0 1 1 51.838267 51.838267 510.46659 510.46659 0 0 1-362.020124 149.947197z" p-id="1718"></path><path d="M950.432368 952.560178L743.022022 745.149832l259.042405-51.632059-51.632059 259.042405z" p-id="1719"></path><path d="M220.435015 367.160086m36.407074 0l513.846101 0q36.407074 0 36.407075 36.407074l0 0.011456q0 36.407074-36.407075 36.407074l-513.846101 0q-36.407074 0-36.407074-36.407074l0-0.011456q0-36.407074 36.407074-36.407074Z" p-id="1720"></path><path d="M221.466052 586.633569m36.407075 0l366.144273 0q36.407074 0 36.407074 36.407074l0 0.011456q0 36.407074-36.407074 36.407074l-366.144273 0q-36.407074 0-36.407075-36.407074l0-0.011456q0-36.407074 36.407075-36.407074Z" p-id="1721">
        </path>
    </svg>
);
export const DecompileIcon = (props: Partial<CustomIconComponentProps>) => (
    <Icon component={DecompileSvg} {...props} />
);