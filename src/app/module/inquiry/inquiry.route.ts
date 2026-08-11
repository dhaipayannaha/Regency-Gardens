import { Router } from 'express';
import { InquiryController } from './inquiry.controller';
import { auth } from '../../middleware/checkAuth';

const router = Router();

router.post('/', auth(), InquiryController.createInquiry);
router.get('/my-inquiries', auth(), InquiryController.getMyInquiries);
router.get('/received', auth(), InquiryController.getReceivedInquiries);
router.delete('/:id', auth(), InquiryController.deleteInquiry);

export const InquiryRoutes = router;