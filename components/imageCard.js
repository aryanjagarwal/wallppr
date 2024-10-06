import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Image } from 'expo-image';
import { getImageSize, wp } from '../helpers/common';
import { theme } from '../constants/theme';

const ImageCard = ({item, index, columns, router}) => {

    const isLastRow = () => {
        return (index + 1) % columns === 0;
    }

    const getImageHeight = () => {
        let {imageHeight: height, imageWidth: width} = item;
        return {height: getImageSize(height, width)};
    }

  return (
    <TouchableOpacity
        onPress={() => router.push({pathname: "home/image", params: {...item}})}
        style={[styles.imageWrapper, !isLastRow() && styles.spacing]}
    >
        <Image
        style={[styles.image, getImageHeight()]}
        source={{ uri: item.webformatURL }}
        transition={100}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    image: {
        height: 300,
        width: '100%',
    },
    imageWrapper: {
        backgroundColor: theme.colors.grayBG,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        overflow: 'hidden',
        marginBottom: wp(2),
    },
    spacing: {
        marginRight: wp(2),
    }
})

export default ImageCard