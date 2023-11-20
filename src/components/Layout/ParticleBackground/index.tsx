import * as React from 'react';
import Particles from 'react-tsparticles';
import './index.scss';

const ParticleBackground = () => {
    return (<Particles
        options={{
        fullScreen: {
            enable: false,
            zIndex: 0
        },
        particles: {
            number: {
                value: 100,
                limit: 300,
                density: {
                    enable: true,
                    value_area: 900
                }
            },
            color: {
                value: '#1CB1C1'
            },
            shape: {
                type: 'circle',
                stroke: {
                    width: 0,
                    color: '#000000'
                },
                polygon: {
                    nb_sides: 5
                },
                image: {
                    src: 'images/github.svg',
                    width: 100,
                    height: 100
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: .5,
                    opacity_min: 0.5,
                    sync: false
                }
            },
            size: {
                value: 20,
                random: true,
                anim: {
                    enable: true,
                    speed: .5,
                    size_min: 10,
                    sync: false
                }
            },
            links: {
                enable: false
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        detectRetina: true,
        fpsLimit: 30,
        
    }}/>);
};

export default ParticleBackground;