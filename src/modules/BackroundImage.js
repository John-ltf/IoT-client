import { Image } from 'semantic-ui-react';
import logo from '../logo.png';

export default function BackroundImage() {
  return (
    <div >
        <Image src={logo} centered size='large' />
    </div>
  )
}