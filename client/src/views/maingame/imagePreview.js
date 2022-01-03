import PropTypes from 'prop-types';

const ImagePreview = ({ imageUri, rotateAngle, ...rest }) => {
  const transformAr = ['rotate(0deg)', 'rotate(90deg)', 'rotate(180deg)', 'rotate(270deg)'];
  return (
    <img
      src={imageUri}
      style={{ transform: transformAr[rotateAngle] }}
    />
  )
}

ImagePreview.propTypes = {
  imageUri: PropTypes.string.isRequired,
  rotateAngle: PropTypes.number.isRequired
};

export default ImagePreview;