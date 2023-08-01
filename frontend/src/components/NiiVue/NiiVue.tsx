import { useRef, useEffect, useState } from 'react'
import { Niivue } from '@niivue/niivue'
import React from "react";
import { Slider, Typography } from 'antd';
interface Props {
  imageUrl: string,
  type: 'mag' | 'phase' | 'qsm'
}

const { Title } = Typography;

const values: any = {
  'mag': {
    min: 0,
    max: 1500,
    defaultRange: [0, 700],
    increment: 5
  },
  'phase': {
    min: null,
    max: null,
    increment: null,
    defaultRange: [-3.1415, 3.1415]
  },
  'qsm': {
    min: -1,
    max: 1,
    defaultRange: [-.1, .1],
    increment: .01
  }
}
const nv = new Niivue()

const NiiVue: React.FC<Props> = ({ imageUrl, type }) => {
  const canvas = useRef()
  const volumeList = [
    {
      url: imageUrl,
    },
  ]
  const [layers, setLayers] = useState(nv.volumes);

  nv.onImageLoaded = () => {
    setLayers([...nv.volumes]);
  };

  useEffect(() => {
    async function fetchData() {
      nv.attachToCanvas(canvas.current);
      await nv.loadVolumes(volumeList);
      setLayers([...nv.volumes])
    }
    fetchData();
  }, [imageUrl]);

  const { max, min, increment, defaultRange } = values[type] as any;

  const [range, setRange] = useState(defaultRange);

  function onRangeChange(newValue: number | number[]) {
    setRange(newValue);
    console.log(range, newValue);
    layers[0].cal_min = range[0];
    layers[0].cal_max = range[1];
    nv.updateGLVolume();
  }

  return (
    <div>
      <Title style={{marginTop: 0}} level={4}>Image Range</Title>
      { type !== 'phase' && (
        <Slider 
          step={increment} 
          value={range} 
          max={max} 
          min={min} 
          onChange={onRangeChange} 
          range
          disabled={false} 
          />
      )}
      <div style={{ minHeight: 480 }}>
        <canvas key={imageUrl} ref={canvas as any} height={480} width={640} />
      </div>
      <br />
 
    </div>
  )
}

export default NiiVue;