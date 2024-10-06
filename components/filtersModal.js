import { View, Text, StyleSheet } from 'react-native'
import React, { useMemo } from 'react'
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { capitalize, hp } from '../helpers/common';
import { theme } from '../constants/theme';
import SectionView, { ColorFilter, CommonFilterRow } from './filterViews';
import { data } from '../constants/data';
import { TouchableOpacity } from 'react-native';

const FiltersModal = ({
    modalRef,
    onClose,
    onApply,
    onReset,
    filters,
    setFilters,
}) => {

    const snapPoints = useMemo(() => ['75%'], []);

    return (
        <BottomSheetModal
            ref={modalRef}
            index={0}
            snapPoints={snapPoints}
            //onChange={handleSheetChanges}
            enablePanDownToClose={true}
            backdropComponent={customBackdrop}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.content}>
                    <Text style={styles.filterText}>Filters</Text>
                    {
                        Object.keys(sections).map((sectionName, index) => {
                            let sectionView = sections[sectionName];
                            let sectionData = data.filters[sectionName];
                            let title = capitalize(sectionName);
                            return (
                                <Animated.View 
                                    key={sectionName}
                                    entering={FadeInDown.delay((index * 100) + 100).springify().damping(11)}
                                >
                                    <SectionView
                                        title={title}
                                        content={sectionView({
                                            data: sectionData,
                                             filters,
                                             setFilters,
                                             filterName: sectionName
                                        })}
                                    />
                                </Animated.View>
                            )
                        })
                    }
                    {/* Actions */}
                    <Animated.View 
                        style={styles.buttons}
                        entering={FadeInDown.delay(500).springify().damping(11)}
                    >
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={onReset}
                        >
                            <Text style={[styles.buttonText, {color: theme.colors.neutral(0.9)}]}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={onApply}
                        >
                            <Text style={[styles.buttonText, {color: theme.colors.white}]}>Apply</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

const sections = {
    "order": (props) => <CommonFilterRow {...props} />,
    "orientation": (props) => <CommonFilterRow {...props} />,
    "type": (props) => <CommonFilterRow {...props} />,
    "colors": (props) => <ColorFilter {...props} />
}


const customBackdrop = ({ animatedIndex, style }) => {

    const containerAnimatedStyle = useAnimatedStyle(() => {
        let opacity = interpolate(
            animatedIndex.value,
            [-1, 0],
            [0, 1],
            Extrapolation.CLAMP
        );
        return {
            opacity
        }
    })

    const containerStyle = [
        StyleSheet.absoluteFill,
        style,
        styles.overlay,
        containerAnimatedStyle,
    ]

    return (
        <Animated.View style={containerStyle}>
            {/* Blur View */}
            <BlurView
                style={StyleSheet.absoluteFill}
                intensity={25}
                tint='dark'
            />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        flex: 1,
        gap: 15,
        //width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    filterText: {
        fontSize: hp(4),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral(0.8),
        marginBottom: 5,
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    applyButton: {
        flex: 1,
        backgroundColor: theme.colors.neutral(0.8),
        padding: 12,
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButton: {
        flex: 1,
        backgroundColor: theme.colors.neutral(0.04),
        padding: 12,
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.grayBG,
    },
    buttonText: {
        fontSize: hp(2.2),
    }
})

export default FiltersModal