//MODULAR HER SECTION COMPONENT

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
  Container, 
  Navbar, 
  Nav, 
  Button, 
  Row, 
  Col, 
  Card, 
  Image 
} from 'react-bootstrap';


/**
 * 
 * @param {*} props.herotitle title of the hero section
 * @param {*} props.herosubtitle subtitle of the hero section 
 * @param {*} props.imgDisposition either 1, 2 or 3 images in the hero section
 * @param {*} props.imgSrc array of image sources to be displayed in the hero section
 * @returns 
 */
export default function HeroSection(props) {

    

    const renderImages = () => {
        const imagesHtmlCode = [];
        const baseStyles = {
            position: 'absolute',
            borderRadius: '1rem',
            boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)',
            objectFit: 'cover',
        };

        if (props.imgDisposition === 1) {
            imagesHtmlCode.push(
                <img
                    key="0"
                    src={props.imgSrc[0]}
                    alt="Fresh food 0"
                    className="img-fluid rounded shadow-lg"
                    style={{ ...baseStyles, top: '0', left: '0', width: '80%', height: '80%', zIndex: 2 }}
                />
            );

        } else if (props.imgDisposition === 2) {
            imagesHtmlCode.push(
                <img
                    key="0"
                    src={props.imgSrc[0]}
                    alt="Fresh food 0"
                    className="img-fluid rounded shadow-lg"
                    style={{ ...baseStyles, top: '10%', left: '0', width: '60%', height: '60%', zIndex: 2 }}
                />,
                <img
                    key="1"
                    src={props.imgSrc[1]}
                    alt="Fresh food 1"
                    className="img-fluid rounded shadow"
                    style={{ ...baseStyles, top: '10%', left: '70%', width: '60%', height: '60%', zIndex: 1 }}
                />
            );
        } else if (props.imgDisposition === 3) {
            imagesHtmlCode.push(
                <img
                    key="0"
                    src={props.imgSrc[0]}
                    alt="Fresh food 0"
                    className="img-fluid rounded shadow-lg"
                    style={{ ...baseStyles, top: '0', left: '0', width: '70%', zIndex: 2, height: 'auto' }}
                />,
                <img
                    key="1"
                    src={props.imgSrc[1]}
                    alt="Fresh food 1"
                    className="img-fluid rounded shadow"
                    style={{ ...baseStyles, bottom: '0', right: '0', left: '80%', width: '60%', top: '25%', height: 'auto', zIndex: 1 }}
                />,
                <img
                    key="2"
                    src={props.imgSrc[2]}
                    alt="Fresh food 2"
                    className="img-fluid rounded shadow"
                    style={{ ...baseStyles, bottom: '0', right: '0', left: '10%', width: '60%', top: '45%', height: 'auto', zIndex: 1 }}
                />
            );
        }

        return imagesHtmlCode;

    }
    return (
        <>
                {/* Hero Section */}
                <div className="bg-success text-white py-5">
                  <Container>
                    <Row className="align-items-center">
                      <Col md={8} className="mb-4 mb-md-0">
                        <h1 id="herotitle" className="display-4 fw-italic" style={{fontFamily: "Ubuntu", fontWeight: 300}}>{props.herotitle}</h1>
                        <h2 id="herosubtitle" className="display-4 fst-italic" style={{fontFamily: "Lobster"}}>{props.herosubtitle}</h2>
                      </Col>
                      <Col md={4} className="position-relative" style={{ height: '400px' }}>
                      <div id = "heroimages" style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {renderImages()}
                      </div>
                    </Col>
        
                    </Row>
                  </Container>
                </div>
                </>
    );

}