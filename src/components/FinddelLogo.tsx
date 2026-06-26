import { SvgXml } from 'react-native-svg';

import { LOGO_SIZE } from '../config';
import { LOADING_LOGO_XML } from '../assets/loadingLogo';

type Props = {
	width?: number;
	height?: number;
};

export function FinddelLogo({ width = LOGO_SIZE.width, height = LOGO_SIZE.height }: Props) {
	return <SvgXml xml={LOADING_LOGO_XML} width={width} height={height} />;
}
