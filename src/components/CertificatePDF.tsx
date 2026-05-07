import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [],
})

const GOLD   = '#b8922a'
const GOLD_L = '#d4aa4a'
const GOLD_XL= '#fdf8ee'
const DARK   = '#1a1208'
const GRAY   = '#6b7280'
const LGRAY  = '#e5e7eb'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // Top gold bar
  topBar: {
    height: 10,
    backgroundColor: GOLD,
    width: '100%',
  },
  // Bottom gold bar
  bottomBar: {
    height: 10,
    backgroundColor: GOLD,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Left side accent
  leftAccent: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 0,
    width: 6,
    backgroundColor: GOLD_L,
  },
  // Right side accent
  rightAccent: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    right: 0,
    width: 6,
    backgroundColor: GOLD_L,
  },
  // Corner ornament top-left
  cornerTL: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 50,
    height: 50,
    borderTop: `3 solid ${GOLD}`,
    borderLeft: `3 solid ${GOLD}`,
  },
  // Corner ornament top-right
  cornerTR: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 50,
    height: 50,
    borderTop: `3 solid ${GOLD}`,
    borderRight: `3 solid ${GOLD}`,
  },
  // Corner ornament bottom-left
  cornerBL: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 50,
    height: 50,
    borderBottom: `3 solid ${GOLD}`,
    borderLeft: `3 solid ${GOLD}`,
  },
  // Corner ornament bottom-right
  cornerBR: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderBottom: `3 solid ${GOLD}`,
    borderRight: `3 solid ${GOLD}`,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 80,
    paddingVertical: 60,
  },
  academyLabel: {
    fontSize: 10,
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dividerLine: {
    height: 1,
    width: 40,
    backgroundColor: GOLD,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  certificateLabel: {
    fontSize: 11,
    color: GRAY,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontFamily: 'Helvetica',
  },
  certTitle: {
    fontSize: 36,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  certSubtitle: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 40,
    textAlign: 'center',
  },
  awardedTo: {
    fontSize: 11,
    color: GRAY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  nameBox: {
    borderBottom: `2 solid ${GOLD}`,
    paddingBottom: 12,
    marginBottom: 40,
    minWidth: 320,
    alignItems: 'center',
  },
  name: {
    fontSize: 32,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  forCompletingLabel: {
    fontSize: 11,
    color: GRAY,
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 18,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 8,
    color: LGRAY,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 'auto',
  },
  footerBlock: {
    alignItems: 'center',
    flex: 1,
  },
  footerLine: {
    width: 120,
    height: 1,
    backgroundColor: LGRAY,
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 9,
    color: GRAY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 10,
    color: DARK,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  stamp: {
    width: 80,
    height: 80,
    borderRadius: 40,
    border: `3 solid ${GOLD}`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stampInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    border: `1 solid ${GOLD_L}`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 7,
    color: GOLD,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
})

interface Props {
  fullName: string
  courseTitle: string
  issuedAt: string
}

export function CertificatePDF({ fullName, courseTitle, issuedAt }: Props) {
  return (
    <Document title={`Zertifikat – ${fullName}`} author="AI Methode Academy">
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Border bars */}
        <View style={styles.topBar} />
        <View style={styles.bottomBar} />
        <View style={styles.leftAccent} />
        <View style={styles.rightAccent} />

        {/* Corner ornaments */}
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        {/* Main content */}
        <View style={styles.content}>

          {/* Academy name */}
          <Text style={styles.academyLabel}>AI Methode Academy</Text>

          {/* Gold divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* Certificate of completion label */}
          <Text style={styles.certificateLabel}>Zertifikat der Teilnahme</Text>

          {/* "Awarded to" */}
          <Text style={styles.awardedTo}>verliehen an</Text>

          {/* Name */}
          <View style={styles.nameBox}>
            <Text style={styles.name}>{fullName}</Text>
          </View>

          {/* Course */}
          <Text style={styles.forCompletingLabel}>für den erfolgreichen Abschluss des Kurses</Text>
          <Text style={styles.courseName}>{courseTitle}</Text>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Privates Weiterbildungszertifikat · Nicht staatlich anerkannt
          </Text>

          {/* Footer row */}
          <View style={styles.footerRow}>

            {/* Stamp */}
            <View style={[styles.footerBlock, { justifyContent: 'flex-end' }]}>
              <View style={styles.stamp}>
                <View style={styles.stampInner}>
                  <Text style={styles.stampText}>{'AI\nMETHODE\nACADEMY'}</Text>
                </View>
              </View>
            </View>

            {/* Date */}
            <View style={[styles.footerBlock, { justifyContent: 'flex-end' }]}>
              <View style={styles.footerLine} />
              <Text style={styles.footerLabel}>Ausgestellt am</Text>
              <Text style={styles.footerValue}>{issuedAt}</Text>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  )
}
